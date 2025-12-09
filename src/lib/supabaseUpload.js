import { supabase } from "../../config/supabaseClient";

export async function uploadImagesToSupabase(
  files,{ bucket, companyName, folder, owner },replaceImage) {
  const results = [];

  for (const item of files) {
    const fileObj = item.file;

    // Validate file
    if (!(fileObj instanceof File) || !fileObj.type.startsWith("image/")) {
      results.push({
        data: null,
        error: new Error("Invalid file or not an image"),
        path: null,
      });
      continue;
    }

    // 🔥 STORAGE PATH (no folder here!)
    const fullPath = `${companyName}/${fileObj.name}`;

    // Upload
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fullPath, fileObj, { upsert: replaceImage });

    if (error) {
      results.push({ data: null, error, path: fullPath });
      continue;
    }

    // Public URL
    const {
      data: { publicUrl },
    } =  supabase.storage.from(bucket).getPublicUrl(fullPath);

    console.log(data, publicUrl,fileObj.size)

    // Insert into images table following your exact schema
    const {data:images,error:imagesError} = await supabase.from("images").insert({
        id:data.id,
        owner: owner ,
        name: fileObj.name,
        folder: folder || null, // folder is only for UI grouping
        storage: bucket,
        url: publicUrl,
        path: fullPath,
        size: fileObj.size,
        mime_type: fileObj.type,
    });

    if (imagesError) {
    console.error("DB Insert Error:", imagesError);
    }

    results.push({
      data,
      error: null,
      url: publicUrl,
      path: fullPath,
      folder: folder || null,
    });
  }

  return results;
}
