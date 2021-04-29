import { NextFunction, Response } from "express";
import { RequestWithFile, RequestWithUser } from "../interfaces/auth.interface";
import { Boat, Equipment, EquipmentType, Hebergement } from "../interfaces/equipments.interface";
import { User } from "../interfaces/users.interface";
import EquipmentService from "../services/equipments.service";

class EquipmentController {
    public equipmentService = new EquipmentService();

    public createBoat = async (req: RequestWithFile, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user: User = req.user;
            const boatData = req.body;
            boatData.owner = user._id;
            if (req.file) {
                boatData.image = req.file.path.split('/').splice(1).join('/');
            }
            const boat: Boat = await this.equipmentService.createBoat(boatData);
            res.status(201).json({ data: boat, message: 'Created Boat' });
        } catch (error) {
            next(error);
        }
    };
    public createEquipment = async (req: RequestWithFile, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user: User = req.user;
            const equipmentData = req.body;
            equipmentData.owner = user._id;
            if (req.file) {
                equipmentData.image = req.file.path.split('/').splice(1).join('/');
            }
            const equipment: Equipment = await this.equipmentService.createEquipment(equipmentData);
            res.status(201).json({ data: equipment, message: 'Created equipment' });
        } catch (error) {
            next(error);
        }
    };
    public createHebergement = async (req: RequestWithFile, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user: User = req.user;
            const equipmentData = req.body;
            equipmentData.owner = user._id;
            if (req.file) {
                equipmentData.image = req.file.path.split('/').splice(1).join('/');
            }
            const hebergement: Hebergement = await this.equipmentService.createHebergement(equipmentData);
            res.status(201).json({ data: hebergement, message: 'Created Hebergement' });
        } catch (error) {
            next(error);
        }
    };

    public updateHebergement = async (req: RequestWithFile, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user: User = req.user;
            const hebergementId: string = req.params.id;
            const hebergementData = req.body;
            hebergementData.owner = user._id;
            if (req.file) {
                hebergementData.image = req.file.path.split('/').splice(1).join('/');
            }
            const hebergement: Hebergement = await this.equipmentService.updateHebergement(hebergementData, hebergementId);
            res.status(201).json({ data: hebergement, message: 'Updated Hebergement' });
        } catch (error) {
            next(error);
        }
    };

    public updateBoat = async (req: RequestWithFile, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user: User = req.user;
            const boatData = req.body;
            const boatdId: string = req.params.id;
            boatData.owner = user._id;
            if (req.file) {
                boatData.image = req.file.path.split('/').splice(1).join('/');
            }
            const boat: Boat = await this.equipmentService.updateBoat(boatData, boatdId);
            res.status(201).json({ data: boat, message: 'Updated Boat' });
        } catch (error) {
            next(error);
        }
    };
    public updateEquipment = async (req: RequestWithFile, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user: User = req.user;
            const equipmentData = req.body;
            const eqId: string = req.params.id;
            equipmentData.owner = user._id;
            if (req.file) {
                equipmentData.image = req.file.path.split('/').splice(1).join('/');
            }
            const equipment: Equipment = await this.equipmentService.updateEquipment(equipmentData, eqId);
            res.status(201).json({ data: equipment, message: 'Updated equipment' });
        } catch (error) {
            next(error);
        }
    };

    public findBoatsByUser = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const ownerId = req.params.id || req.user._id;
            const boats: Boat[] = await this.equipmentService.findBoatsByUser(ownerId);
            res.status(200).json({ data: boats });
        } catch (error) {
            next(error);
        }
    }

    public findEquipmentsByUser = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const ownerId = req.params.id || req.user._id;
            const equipments: Equipment[] = await this.equipmentService.findEquipmentsByUser(ownerId);
            res.status(200).json({ data: equipments });
        } catch (error) {
            next(error);
        }
    }

    public findEquipmentsByTypeAndUser = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const ownerId = req.params.ownerId;
            const typeId = req.params.typeId;
            const { equipments, type } = await this.equipmentService.findEquipmentsByTypeAndUser(typeId, ownerId);
            res.status(200).json({ data: { equipments, type } });
        } catch (error) {
            next(error);
        }
    }

    public findHebergementsByUser = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const ownerId = req.params.id || req.user._id;
            const hebergements: Hebergement[] = await this.equipmentService.findHebergementsByUser(ownerId);
            res.status(200).json({ data: hebergements });
        } catch (error) {
            next(error);
        }
    }

    public findHebergements = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const hebergements: Hebergement[] = await this.equipmentService.findAllHebergements();
            res.status(200).json({ data: hebergements });
        } catch (error) {
            next(error);
        }
    }

    public findTypes = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const types: EquipmentType[] = await this.equipmentService.findEquipmentTypes();
            res.status(200).json({ data: types });
        } catch (error) {
            next(error);
        }
    }

    public deleteEquipment = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            let id = req.params.id;
            const equipment: Equipment = await this.equipmentService.deleteEquipment(id);
            res.status(200).json({ data: equipment });
        } catch (error) {
            next(error);
        }
    }
    public deleteBoat = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            let id = req.params.id
            const boat: Boat = await this.equipmentService.deleteBoat(id);
            res.status(200).json({ data: boat });
        } catch (error) {
            next(error);
        }
    }
    public deleteHebergement = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            let id = req.params.id
            const hebergement: Boat = await this.equipmentService.deleteHebergement(id);
            res.status(200).json({ data: hebergement });
        } catch (error) {
            next(error);
        }
    }

}

export default EquipmentController