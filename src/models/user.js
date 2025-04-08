import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        bio: { type: String, default: '' }, // Add bio field
        skillsDesired: { type: [String], default: [] }, // Array of desired skills
        skillsHave: { type: [String], default: [] }, // Array of skills the user has
    },
    { timestamps: true },
);

const User = mongoose.model('User', userSchema);
export default User;
