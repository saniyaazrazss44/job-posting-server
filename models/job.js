const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const jobSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['Sales', 'IT and Software', 'Data Entry', 'Manager', 'Graphic Designer']
    },
    type: {
        type: String,
        required: true,
        enum: ['remote', 'work from office', 'hybrid']
    },
    job_list: {
        type: ObjectId,
        required: true,
        ref: 'JobList'
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model("Job", jobSchema)