export class Room {
    adminId: string;
    adminName: string;
    roomName: string;

    init(id: string, adminName: string, roomName: string){
        this.adminId = id;
        this.adminName = adminName;
        this.roomName = roomName;
    }
}
