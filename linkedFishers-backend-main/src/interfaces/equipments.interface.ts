import { User } from "./users.interface";

export class Equipment {
    _id: string;
    name: string;
    owner: User;
    type: EquipmentType;
    image: string;
    description: string;
    isAvailable: boolean;
}
export class EquipmentType {
    _id: string;
    name: string;
    icon: string;
    items: any[];
}

export class Boat {
    _id: string;
    name: string;
    owner: User;
    image: string;
    description: string;
    isAvailable: boolean;
}

export class Hebergement {
    _id: string;
    name: string;
    owner: User;
    image: string;
    description: string;
    isAvailable: boolean;
    adress: string;
    price: number;
    position: any;
}

export class Reservation {
    _id: string;
    reservedBy: any
    home: any
    dateStart: Date
    dateEnd: Date
}