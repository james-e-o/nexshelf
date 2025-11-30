import { supabase } from "../../config/supabaseClient"

export async function uploadImagesToSupabase(files,  { bucket, companyName, folder }) {
    const results = []

    for (const item of files) {
        const fileObj = item.file; // this is the actual File object

        if (!(fileObj instanceof File) || !fileObj.type.startsWith('image/')) {
            results.push({
            data: null,
            error: new Error("Invalid file or not an image"),
            path: null
            });
            continue;
        }

        let fullPath = `${companyName}/${fileObj.name}`;
        
        if (folder && folder.trim() !== "") {
            fullPath = `${companyName}/${folder}/${fileObj.name}`;
        }

        const { data, error } = await supabase.storage.from(bucket).upload(fullPath, fileObj, {
            upsert: true
        });

        results.push({ data, error, path: fullPath });
        }


    return results;
}
