class ApiEsponse {
  constructor(statuscode, data, message = "Success") {
    this.statuscode = statuscode;
    (this.data = data), (this.message = message);
    this.sucess = statuscode; 
  }
}
