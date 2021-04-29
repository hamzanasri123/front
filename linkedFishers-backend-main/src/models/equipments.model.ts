import mongoose from 'mongoose';
import { Boat, Equipment, EquipmentType, Hebergement, Reservation } from "../interfaces/equipments.interface";

const equipmentTypeSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    icon: { type: String }
});

const equipmentSchema = new mongoose.Schema({
    name: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    image: String,
    type: { type: mongoose.Schema.Types.ObjectId, ref: "EquipmentType", required: true },
    description: String,
});

const hebergementSchema = new mongoose.Schema({
    name: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    image: String,
    adress: String,
    description: String,
    price: Number,
    position: {
        coordinates: { type: [Number], index: '2dsphere' }
    },
});

const boatSchema = new mongoose.Schema({
    name: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    image: String,
    description: String,
});

const reservationSchema = new mongoose.Schema({
    reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ownedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    home: { type: mongoose.Schema.Types.ObjectId, ref: "Hebergement", required: true },
    dateStart: mongoose.Schema.Types.Date,
    dateEnd: mongoose.Schema.Types.Date,
    status: { type: mongoose.Schema.Types.String, default: "pending" }
});
equipmentSchema.set('timestamps', true);
hebergementSchema.set('timestamps', true);
boatSchema.set('timestamps', true);
reservationSchema.set('timestamps', true);

const equipmentModel = mongoose.model<Equipment & mongoose.Document>('Equipment', equipmentSchema);
const equipmentTypetModel = mongoose.model<EquipmentType & mongoose.Document>('EquipmentType', equipmentTypeSchema);
const hebergementtModel = mongoose.model<Hebergement & mongoose.Document>('Hebergement', hebergementSchema);
const boattModel = mongoose.model<Boat & mongoose.Document>('Boat', boatSchema);
const reservationtModel = mongoose.model<Reservation & mongoose.Document>('Reservation', reservationSchema);
const models = {
    equipmentModel, equipmentTypetModel,
    hebergementtModel,
    boattModel,
    reservationtModel
};

export default models;