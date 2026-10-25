
"use strict";

/*
 * CrowRules Memorials Gallery
 *
 * Local preview mode works without Supabase configuration.
 * Persistent mode requires the SQL setup below, a Storage bucket,
 * and an authenticated account authorized to upload.
 *
 * Never put a Supabase service-role or secret key in browser code.
 */

const MEMORIAL_GALLERY_CONFIG = {
  supabaseUrl: "",
  publishableKey: "",
  bucket: "memorial-media",
  imageMaxBytes: 10 * 1024 * 1024,
  videoMaxBytes: 100 * 1024 * 1024
};

(() => {
  const $ = (selector) => document.querySelector(selector);

  const photoInput = $("#photo-upload");
  const videoInput = $("#video-upload");
  if (!photoInput || !videoInput) return;

  const photoForm = $("#photo-caption-form");
  const videoForm = $("#video-caption-form");
  const photoStatus = $("#photo-status");
  const videoStatus = $("#video-status");
  const photoGallery = $("#photo-gallery");
  const videoGallery = $("#video-gallery");
  const lightbox = $("#media-lightbox");

  let selectedPhotos = [];
  let selectedVideos = [];
  let supabase = null;
  let currentMemorialId = null;

  const localItems = { photo: [], video: [] };
  const objectUrls = [];

  function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;",
      '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function setStatus(type, message) {
    (type === "photo" ? photoStatus : videoStatus).textContent = message;
  }

  function fileExtension(file) {
    const name = file.name || "";
    const dot = name.lastIndexOf(".");
    return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
  }

  function validateFiles(files, type) {
    const accepted = type === "photo"
      ? ["image/jpeg", "image/png", "image/webp", "image/gif"]
      : ["video/mp4", "video/webm", "video/ogg"];

    const maxBytes = type === "photo"
      ? MEMORIAL_GALLERY_CONFIG.imageMaxBytes
      : MEMORIAL_GALLERY_CONFIG.videoMaxBytes;

    const valid = [];
    const errors = [];

    for (const file of files) {
      if (!accepted.includes(file.type)) {
        errors.push(`${file.name}: unsupported file type.`);
      } else if (file.size > maxBytes) {
        errors.push(`${file.name}: file is too large.`);
      } else {
        valid.push(file);
      }
    }

    if (errors.length) setStatus(type, errors.join(" "));
    else setStatus(type, "");

    return valid;
  }

  function makeLocalItem(file, type, caption) {
    const url = URL.createObjectURL(file);
    objectUrls.push(url);

    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      type,
      url,
      caption: caption || file.name.replace(/\.[^.]+$/, ""),
      createdAt: new Date().toISOString(),
      local: true
    };
  }

  function makeCard(item, type) {
    const title = escapeHTML(item.caption || "A cherished memory");
    const safeUrl = escapeHTML(item.url);

    const media = type === "photo"
      ? `<img src="${safeUrl}" alt="${title}" loading="lazy">`
      : `<div class="video-thumb">
           <video src="${safeUrl}" preload="metadata" muted playsinline></video>
           <span class="video-play-mark" aria-hidden="true">▶</span>
         </div>`;

    return `
      <article class="media-card">
        <button class="media-open" type="button"
          data-gallery-open="${escapeHTML(item.id)}"
          data-gallery-type="${type}"
          aria-label="Open ${type === "photo" ? "photograph" : "video"}: ${title}">
          <div class="media-frame">${media}</div>
        </button>
        <div class="media-card-body">
          <span class="media-type-label">${type === "photo" ? "Photograph" : "Video memory"}</span>
          <h3>${title}</h3>
          ${item.local ? '<p>Local preview — not yet uploaded</p>' : ""}
        </div>
      </article>`;
  }

  function renderGallery(type) {
    const items = localItems[type];
    const target = type === "photo" ? photoGallery : videoGallery;
    const count = type === "photo" ? $("#photo-count") : $("#video-count");

    count.textContent = `${items.length} ${type === "photo" ? "photograph" : "video"}${items.length === 1 ? "" : "s"}`;

    target.innerHTML = items.length
      ? items.map(item => makeCard(item, type)).join("")
      : `<div class="gallery-empty">
           <p>${type === "photo" ? "No photographs have been added to this gallery yet." : "No videos have been added to this gallery yet."}</p>
           <p>With permission, you can help preserve these memories.</p>
         </div>`;
  }

  async function loadApprovedMedia() {
    if (!supabase || !currentMemorialId) { renderGallery("photo"); renderGallery("video"); return; }
    for (const type of ["photo", "video"]) {
      const target = type === "photo" ? photoGallery : videoGallery;
      target.innerHTML = '<p class="muted">Loading approved media…</p>';
      const query = type === "photo"
        ? supabase.from("memorial_photos").select("id, memorial_id, image_url, caption, created_at, storage_path").eq("memorial_id", currentMemorialId).eq("published", true).eq("review_status", "approved").order("created_at", { ascending: false })
        : supabase.from("memorial_videos").select("id, memorial_id, video_url, title, thumbnail_url, description, created_at, published, status").eq("memorial_id", currentMemorialId).eq("published", true).eq("status", "published").order("created_at", { ascending: false });
      const { data, error } = await query;
      if (error) { target.innerHTML = '<p class="muted">The gallery could not be loaded. ' + escapeHTML(error.message) + '</p>'; continue; }
      localItems[type] = (data || []).map(row => {
        let url = type === "photo" ? row.image_url : row.video_url;
        if (!url && row.storage_path) url = supabase.storage.from(MEMORIAL_GALLERY_CONFIG.bucket).getPublicUrl(row.storage_path)?.data?.publicUrl || "";
        return { id: row.id, type, url: url || "", caption: type === "photo" ? (row.caption || "A cherished memory") : (row.title || row.description || "A video memory"), local: false };
      }).filter(item => item.url);
      renderGallery(type);
    }
  }

  function addLocalPreviews(files, type, caption = "") {
    const newItems = files.map(file => makeLocalItem(file, type, caption));
    localItems[type] = [...newItems, ...localItems[type]];
    renderGallery(type);
  }

  function openLightbox(item, type) {
    const content = $("#lightbox-content");
    const caption = $("#lightbox-caption");

    if (!content || !caption || !lightbox) return;

    content.innerHTML = type === "photo"
      ? `<img src="${escapeHTML(item.url)}" alt="${escapeHTML(item.caption)}">`
      : `<video src="${escapeHTML(item.url)}" controls autoplay playsinline></video>`;

    caption.textContent = item.caption || "A cherished memory";

    if (typeof lightbox.showModal === "function") {
      lightbox.showModal();
    } else {
      lightbox.setAttribute("open", "");
    }
  }

  async function uploadFiles(files, type, caption) {
    if (!files.length) {
      setStatus(type, "Select at least one file first.");
      return;
    }

    if (!supabase) {
      addLocalPreviews(files, type, caption);
      setStatus(type,
        "Preview added to this browser only. Configure Supabase to save files for other visitors.");
      return;
    }

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    const user = sessionData?.session?.user;

    if (sessionError || !user) {
      setStatus(type, "Please sign in with an authorized account before uploading.");
      return;
    }

    if (!currentMemorialId) {
      setStatus(type, "A memorial ID is required before uploading.");
      return;
    }

    const input = type === "photo" ? photoInput : videoInput;
    const form = type === "photo" ? photoForm : videoForm;
    const submitButton = form.querySelector('button[type="submit"]');

    submitButton.disabled = true;

    let completed = 0;
    const failures = [];

    try {
      for (const file of files) {
        const extension = fileExtension(file);
        const path = `${currentMemorialId}/${user.id}/${crypto.randomUUID()}.${extension}`;

        const { error: storageError } = await supabase.storage
          .from(MEMORIAL_GALLERY_CONFIG.bucket)
          .upload(path, file, {
            contentType: file.type,
            upsert: false
          });

        if (storageError) {
          failures.push(`${file.name}: ${storageError.message}`);
          continue;
        }

        const publicUrl = supabase.storage.from(MEMORIAL_GALLERY_CONFIG.bucket).getPublicUrl(path)?.data?.publicUrl || "";
        const memorialName = document.querySelector("#memorial-heading")?.textContent || null;
        const rowPayload = type === "photo"
          ? { memorial_id: currentMemorialId, image_url: publicUrl, caption: (caption || file.name).slice(0, 200), alt_text: (caption || file.name).slice(0, 200), uploaded_by: user.id, published: false, review_status: "pending", storage_path: path }
          : { memorial_id: currentMemorialId, title: (caption || file.name).slice(0, 200), video_url: publicUrl, description: (caption || file.name).slice(0, 200), person_name: memorialName, memorial_name: memorialName, uploaded_by: user.id, published: false, status: "pending" };
        const { error: rowError } = await supabase
          .from(type === "photo" ? "memorial_photos" : "memorial_videos")
          .insert(rowPayload);

        if (rowError) {
          failures.push(`${file.name}: file uploaded, but its review record could not be saved.`);
          continue;
        }

        completed++;
      }

      if (completed) {
        setStatus(type,
          `${completed} file(s) submitted successfully for review. They will appear in the public gallery after approval.`);
      }

      if (failures.length) {
        setStatus(type, `${completed} submitted. ${failures.join(" ")}`);
      }

      input.value = "";
      form.reset();
      form.hidden = true;
    } catch (error) {
      setStatus(type, error.message || "An unexpected upload error occurred.");
    } finally {
      submitButton.disabled = false;
    }
  }

  function setupPicker(input, type, form, selectionSetter) {
    input.addEventListener("change", () => {
      const files = validateFiles([...input.files], type);
      selectionSetter(files);
      form.hidden = files.length === 0;

      if (files.length) {
        const total = files.reduce((sum, file) => sum + file.size, 0);
        setStatus(type,
          `${files.length} file(s) selected · ${(total / (1024 * 1024)).toFixed(1)} MB total. Add a caption and upload.`);
      }
    });
  }

  setupPicker(photoInput, "photo", photoForm, files => {
    selectedPhotos = files;
  });

  setupPicker(videoInput, "video", videoForm, files => {
    selectedVideos = files;
  });

  photoForm.addEventListener("submit", async event => {
    event.preventDefault();
    await uploadFiles(selectedPhotos, "photo", $("#photo-caption").value.trim());
    selectedPhotos = [];
    photoInput.value = "";
  });

  videoForm.addEventListener("submit", async event => {
    event.preventDefault();
    await uploadFiles(selectedVideos, "video", $("#video-caption").value.trim());
    selectedVideos = [];
    videoInput.value = "";
  });

  $("#cancel-photo-upload").addEventListener("click", () => {
    selectedPhotos = [];
    photoInput.value = "";
    photoForm.reset();
    photoForm.hidden = true;
    setStatus("photo", "");
  });

  $("#cancel-video-upload").addEventListener("click", () => {
    selectedVideos = [];
    videoInput.value = "";
    videoForm.reset();
    videoForm.hidden = true;
    setStatus("video", "");
  });

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-gallery-open]");
    if (!button) return;

    const type = button.dataset.galleryType;
    const item = localItems[type].find(
      entry => String(entry.id) === button.dataset.galleryOpen
    );

    if (item) openLightbox(item, type);
  });

  $("#lightbox-close").addEventListener("click", () => lightbox.close());

  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) lightbox.close();
  });

  lightbox.addEventListener("close", () => {
    $("#lightbox-content").innerHTML = "";
  });

  async function initialize() {
    const config = MEMORIAL_GALLERY_CONFIG;
    const id = new URLSearchParams(location.search).get("id");

    currentMemorialId = id;

    if (config.supabaseUrl && config.publishableKey &&
        window.supabase?.createClient) {
      supabase = window.supabase.createClient(
        config.supabaseUrl,
        config.publishableKey
      );

      await loadApprovedMedia();
    } else {
      renderGallery("photo");
      renderGallery("video");
      setStatus("photo", "Preview mode is active. Uploads remain in this browser.");
    }
  }

  window.addEventListener("beforeunload", () => {
    objectUrls.forEach(url => URL.revokeObjectURL(url));
  });

  initialize().catch(error => {
    console.error("Memorial gallery initialization failed:", error);
    setStatus("photo", "The gallery could not initialize.");
    renderGallery("photo");
    renderGallery("video");
  });
})();
