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
let QuestionChannel = class QuestionChannel {
    id;
    channelId;
    guildId;
    qna;
    currentQuestion;
    questionMessage;
    createdAt;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], QuestionChannel.prototype, "id", void 0);
__decorate([
    Column({ type: "varchar", nullable: false }),
    __metadata("design:type", String)
], QuestionChannel.prototype, "channelId", void 0);
__decorate([
    Column({ type: "varchar", nullable: false }),
    __metadata("design:type", String)
], QuestionChannel.prototype, "guildId", void 0);
__decorate([
    Column({ type: "text", nullable: false }),
    __metadata("design:type", String)
], QuestionChannel.prototype, "qna", void 0);
__decorate([
    Column({ type: "varchar", nullable: false }),
    __metadata("design:type", String)
], QuestionChannel.prototype, "currentQuestion", void 0);
__decorate([
    Column({ type: "varchar", nullable: false }),
    __metadata("design:type", String)
], QuestionChannel.prototype, "questionMessage", void 0);
__decorate([
    Column({ type: "bigint", nullable: false }),
    __metadata("design:type", Number)
], QuestionChannel.prototype, "createdAt", void 0);
QuestionChannel = __decorate([
    Entity()
], QuestionChannel);
export default QuestionChannel;
