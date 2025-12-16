import { Schema, model } from 'mongoose';
import { hashPassword, comparePassword } from '../utils/utils.js';

const userSchema = new Schema({
    email: { type: String, required: true },
    nickname: { type: String, required: true, minlength: 3 },
    hashedPassword: { type: String, required: true },
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    requests: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

userSchema.index({ nickname: 1 }, {
    unique: true,
    collation: { locale: 'en', strength: 2 }
});

userSchema.methods.comparePassword = async function (password) {
    return await comparePassword(password, this.hashedPassword);
};

userSchema.pre('save', async function (next) {
    if (this.isModified('hashedPassword')) {
        this.hashedPassword = await hashPassword(this.hashedPassword);
    }
    next();
});

const User = model('User', userSchema);
export default User;
