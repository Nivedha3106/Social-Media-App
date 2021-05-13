const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dotenv = require('dotenv');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {check, validationResult } = require('express-validator');

// @route GET
router.get('/indexAuth', auth, async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }
    catch(err){
        res.status(500).send('Server Error');
    }
});

// @route POST postAuth
router.post('/postAuth', [
    check('email', 'Enter a valid email').isEmail(),
    check('password', 'Password is required').exists()
],async(req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    
        const {name, email, password } = req.body;
        let user = await User.findOne({email});
        
        try {
            if(!user){
                res.status(400).json({errors : [{msg : 'Invalid credentials '}]})
            }
            
            const isMatch = await bcrypt.compare(password,user.password);
            if(!isMatch) {
                res.status(400).json({errors : [{msg : 'Password invalid'}]})
            }
            const payload = {
                user : {
                    id : user.id
                }
            }
            
        jwt.sign(payload, process.env.jwtSecret,
        {expiresIn : 360000},
        (err, token) => {
            if(err) throw err;
            res.json({token});
        });
        }
        catch(err){
            res.json({message : err});
            console.log("catch");
        }      
});

//View all users*
router.get('/getAuth', async (req,res)=>{
    try{
        const Alluser = await User.find();
        res.json(Alluser);
    }
    catch(err){
        res.json({message : err});
    }
});


module.exports = router;