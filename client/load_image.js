export async function load_image_url(url) {
    const image = new Image()
    image.src = url
    return new Promise((resolve, reject) => {
        image.onload = () => resolve(image)
        image.onerror = (err) => reject(err)
    })
}