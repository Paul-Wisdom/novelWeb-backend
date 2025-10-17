import { FileUploadCreateReadStream } from "graphql-upload/processRequest.mjs"
import cloudinary from "./config"
import { resolve } from "path"

export const imageUploadStream = async ({folder, publicId, createReadStream}:{folder: string, publicId: string, createReadStream: FileUploadCreateReadStream}): Promise<{url: string, publicId: string}> => {
    const stream = createReadStream()
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
            folder: folder,
            public_id: publicId,
            resource_type: 'image'
            
        }, (error, result) => {
            if (error) return reject(error)
            resolve({
                url: result!.secure_url,
                publicId: result!.public_id
            })
        })
        stream.on('data', () => console.log('streaming'))
        stream.pipe(uploadStream)
    })

}