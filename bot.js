const urlParams = new URLSearchParams(window.location.search)
const token = urlParams.get("token")

if (!token) {
    throw new Error("Token is missing in the URL. Use ?token=YOUR_TOKEN")
}

const apiUrl = `https://api.telegram.org/bot${token}/`
let offset = 0

async function getUpdates() {
    try {
        const response = await fetch(`${apiUrl}getUpdates?offset=${offset + 1}&timeout=1`)
        const data = await response.json()

        if (data.ok) {
            for (const update of data.result) {
                offset = update.update_id
                handleUpdate(update)
            }
        }
    } catch (e) {
        console.error("Error fetching updates:", e)
    }
}

setInterval(getUpdates, 500)
