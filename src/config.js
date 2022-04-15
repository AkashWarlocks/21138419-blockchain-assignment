require('dotenv').config()


const INFURA_URL = process.env.INFURA_URL
const USER_KEYS = {
    publicKey: process.env.PUBLIC_KEY,
    privateKey: process.env.PRIVATE_KEY,
}

const ROPSTEN_URL = process.env.ROPSTEN_URL

module.exports = {
    INFURA_URL,
    USER_KEYS,
    ROPSTEN_URL
}