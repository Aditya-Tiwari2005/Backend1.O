class ApiResponse {
    constructor(statusCode,data,message="Success"){
        this.data = data
        this.message=message
        this.succees=statusCode < 400
    }
}