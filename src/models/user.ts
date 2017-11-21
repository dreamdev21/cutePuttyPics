export interface User {
    id:number;
    fullName: string;
    email: string;
    password: string;
    groupId:number;
    qrId:number;
    permission:number;
    gender:number;
    role:number;
    avatar:string;
    birthday:Date;
    paypalEmail:string;
    paypalPassword:string;
    paypalVerifyState:number;
}
