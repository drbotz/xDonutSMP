var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
let Ticket = class Ticket {
    id;
    date;
    channel;
    startingMessage;
    user;
    state;
    added;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Ticket.prototype, "id", void 0);
__decorate([
    Column({ type: "varchar", nullable: false }),
    __metadata("design:type", Number)
], Ticket.prototype, "date", void 0);
__decorate([
    Column({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], Ticket.prototype, "channel", void 0);
__decorate([
    Column({ type: "varchar", nullable: false }),
    __metadata("design:type", String)
], Ticket.prototype, "startingMessage", void 0);
__decorate([
    Column({ type: "varchar", nullable: false }),
    __metadata("design:type", String)
], Ticket.prototype, "user", void 0);
__decorate([
    Column({ type: "varchar", nullable: false }),
    __metadata("design:type", String)
], Ticket.prototype, "state", void 0);
__decorate([
    Column({ type: "text", nullable: true }),
    __metadata("design:type", String)
], Ticket.prototype, "added", void 0);
Ticket = __decorate([
    Entity()
], Ticket);
export default Ticket;
