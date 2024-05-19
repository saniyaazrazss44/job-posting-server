const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const Admin = require('../models/admin');
const Job = require('../models/job');
const JobList = require('../models/jobList');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyJwt = require('../middleware/authMiddleware')
const { ObjectId } = require('mongoose').Types;

router.use(bodyParser.json());

router.post('/create', async (req, res) => {
    try {
        const existingAdmin = await Admin.findOne();
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const email = 'admin@gmail.com';
        const password = '12345';

        const hashedPassword = await bcrypt.hash(password, 10);

        const defaultAdmin = new Admin({
            email: email,
            password: hashedPassword
        });

        await defaultAdmin.save();

        res.status(200).json({
            status: 200,
            email: email,
            message: 'Default admin created successfully',
        })

    } catch (error) {
        console.error('Error creating default admin:', error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error'
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email && !password) {
            return res.status(400).json({
                status: 400,
                message: "Please fill all the inputs"
            });
        }

        const admin = await Admin.findOne({ email: email });
        if (!admin) {
            return res.status(404).json({
                status: 404,
                message: 'Admin not found'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: 401,
                message: "Invalid Password"
            });
        }

        const token = jwt.sign({ email: admin.email }, process.env.SECRET_KEY);

        res.status(200).json({
            status: 200,
            message: 'Login successful',
            token: token
        });

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Internal server error'
        });
    }
});

router.post("/postNewJob", async (req, res) => {
    try {
        const {
            title,
            company,
            skills,
            experience_required,
            description,
            salary,
            additional_details,
            category,
            type
        } = req.body;

        if (!title || !company || !skills || !experience_required || !description || !salary || !category || !type) {
            return res.status(400).json({
                status: 400,
                message: "Please fill all the inputs"
            });
        }

        const jobListDetails = {
            title,
            company,
            skills,
            experience_required,
            description,
            salary,
            additional_details
        };

        const jobList = new JobList(jobListDetails);
        await jobList.save();

        const jobDetails = {
            category,
            type,
            job_list: jobList._id
        };

        const job = new Job(jobDetails);
        await job.save();

        const fullJobDetails = await Job.findById(job._id).populate('job_list').exec();

        res.status(200).json({ fullJobDetails, jobList });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error'
        });
    }
});

router.get("/viewAllJobs", async (req, res) => {
    try {
        const jobs = await Job.find().populate('job_list').exec();
        res.status(200).json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: 'Internal server error'
        });
    }
});

module.exports = router;