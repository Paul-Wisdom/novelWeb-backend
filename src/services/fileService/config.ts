import {v2 as cloudinary} from 'cloudinary'
import { CLOUD_KEY, CLOUD_NAME, CLOUDINARY_SECRET } from '../../config'

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_KEY,
    api_secret: CLOUDINARY_SECRET,
    secure: true
})

export default cloudinary