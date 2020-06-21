

class OrderException extends Error {
    type
    message
    constructor(msg, type) {
        super()
        this.message = msg
        this.type = type
    }

}

export {
    OrderException
}