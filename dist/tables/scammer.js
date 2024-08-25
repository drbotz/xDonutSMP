var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
let Scammer = class Scammer {
    id;
    date;
    message;
    messageURL;
    reporter;
    reporterUUID;
    scammerIGN;
    scammerUUID;
    scammerDiscord;
    description;
    proof;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Scammer.prototype, "id", void 0);
__decorate([
    Column({ type: "varchar", nullable: false }),
    __metadata("design:type", Number)
], Scammer.prototype, "date", void 0);
__decorate([
    Column({ type: "varchar", nullable: false }),
    __metadata("design:type", String)
], Scammer.prototype, "message", void 0);
__decorate([
    Column({ type: "varchar", nullable: false }),
    __metadata("design:type", String)
], Scammer.prototype, "messageURL", void 0);
__decorate([
    Column({ type: "varchar", nullable: false }),
    __metadata("design:type", String)
], Scammer.prototype, "reporter", void 0);
__decorate([
    Column({ type: "varchar", nullable: false }),
    __metadata("design:type", String)
], Scammer.prototype, "reporterUUID", void 0);
__decorate([
    Column({ type: "varchar", nullable: false }),
    __metadata("design:type", String)
], Scammer.prototype, "scammerIGN", void 0);
__decorate([
    Column({ type: "varchar", nullable: false }),
    __metadata("design:type", String)
], Scammer.prototype, "scammerUUID", void 0);
__decorate([
    Column({ type: "varchar", nullable: true }),
    __metadata("design:type", String)
], Scammer.prototype, "scammerDiscord", void 0);
__decorate([
    Column({ type: "text", nullable: false }),
    __metadata("design:type", String)
], Scammer.prototype, "description", void 0);
__decorate([
    Column({ type: "text", nullable: false }),
    __metadata("design:type", String)
], Scammer.prototype, "proof", void 0);
Scammer = __decorate([
    Entity()
], Scammer);
export default Scammer;
