const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyJwt = require('../middleware/authMiddleware')
const { ObjectId } = require('mongoose').Types;

router.use(bodyParser.json());

router.post("/register", async (req, res) => {
    try {

        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                status: 400,
                message: "All fields are required"
            })
        }

        const existingEmail = await User.findOne({ email: email })
        if (existingEmail) {
            return res.status(409).json({
                status: 409,
                message: 'Email id already exists'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const userData = new User({
            name,
            email,
            password: hashedPassword
        })

        const userResponse = await userData.save()

        const token = jwt.sign({ userId: userResponse._id }, process.env.SECRET_KEY)

        res.status(200).json({
            status: 200,
            message: 'User registered successfully',
            token: token
        })

    } catch (error) {

        res.status(500).json({
            status: 500,
            message: 'Internal server error'
        });
    }
})

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 400,
                message: "All fields are required"
            })
        }

        const validUser = await User.findOne({ email })
        if (!validUser) {
            return res.status(409).json({
                status: 409,
                message: 'Invalid credentials'
            })
        }

        const passwordMatch = await bcrypt.compare(password, validUser.password)
        if (!passwordMatch) {
            return res.status(401).json({
                status: 401,
                message: "Invalid password"
            })
        }

        const token = jwt.sign({ userId: validUser._id }, process.env.SECRET_KEY)

        res.status(200).json({
            status: 200,
            message: 'Login successful',
            userId: validUser._id,
            email: validUser.email,
            name: validUser.name,
            token: token
        })

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Internal server error'
        });
    }
})

module.exports = router;