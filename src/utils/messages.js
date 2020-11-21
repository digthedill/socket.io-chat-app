const generateMsg = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}
const generateLocationMsg = (username, url) => {
    return {
        url,
        createdAt: new Date().getTime(),
        username

    }
}

module.exports = {
    generateMsg,
    generateLocationMsg
}