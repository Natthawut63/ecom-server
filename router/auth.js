const express = require('express')
const router = express.Router()
//import controller
const {register , login ,currentUser,currentAdmin} = require('../controllers/auth')
//import middleware
const {authCheck,adminCheck} = require('../middlewares/authCheck')

router.post('/register' , register)
router.post('/login' , login)
router.post('/current-user',authCheck,currentUser)
router.post('/current-admin',authCheck,adminCheck,currentAdmin)

module.exports = router