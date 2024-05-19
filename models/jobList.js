const mongoose = require('mongoose');

const jobListSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    skills: {
        type: String,
        required: true
    },
    experience_required: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    salary: {
        type: String,
        required: true
    },
    additional_details: {
        type: String
    }
});

module.exports = mongoose.model("JobList", jobListSchema)