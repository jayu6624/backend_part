class APIerror extends Error
{
    constructor(
        statuscode,
        message="Somthing wents wrong",
        error = [],
        stack  = "",)
    
    {
        super(message);
        this.statuscode = statuscode;
        this.data = null;
        this.message=message;
        this.success=false;
        this.error=this.errors

        if(stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}
export default APIerror