export interface User {
    id:number;
    fullname: string;
    email: string;
    password: string;
    cardname: string;
    cardnumber: number;
    expirydate: Date;
    role:number;
    cvv: number;
    permission:number;
    gender:number;
    avatar:string;
    birthday:Date;
    paypalemail:string;
    paypalpassword:string;
    paypalverifystate:number;
}
