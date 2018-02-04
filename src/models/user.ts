export interface User {
    id:number;
    fullName: string;
    email: string;
    password: string;
    groupId:number;
    groupName:string;
    qrId:number;
    qrName:string;
    permission:number;
    qrRequested:number;
    role:number;
    avatar:string;
    address:string;
    paypalEmail:string;
    paypalPassword:string;
    streetAddress1:string;
    streetAddress2:string;
    city:string;
    state:string;
    zipCode:string;
    bankAccountName:string;
    bankAccountNumber:string;
    bankName:string;
    bankRouting:string;
    cashoutMethod:number;
}
