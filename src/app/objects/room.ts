export class Room {
    adminId: string;
    adminName: string;
    roomName: string;
    //Stores if room has active password.
    password: boolean;
    //Stores if room is manually authenticated.
    manual: boolean;

    init(id: string, adminName: string, roomName: string, password: boolean, manual: boolean){
        this.adminId = id;
        this.adminName = adminName;
        this.roomName = roomName;
        this.password = password;
        this.manual = manual;
    }
}
