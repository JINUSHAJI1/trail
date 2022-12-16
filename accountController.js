const { Role, User, Case } = require("../../../data/models");
const ResponseModel = require('../../../utilities/responseModel');
const tokenHandler = require('../../../utilities/tokenHandler');


// GETTING ROLE ID 

module.exports.rolecall = async (req, res) => {
    const { role } = req.body;
    var accessrole = await Role.findOne({
        where: {
            role: role
        }
    });

    if (!accessrole) {
        return res.json(new ResponseModel(null, null, ['No role found']));
    }

    // Create token.
    const token = tokenHandler.createToken({
        id: accessrole.id,
        role: accessrole.role
    });
    console.log('111111111111111111')
    console.log(accessrole.id);
    console.log(accessrole.role);

    res.json(new ResponseModel(token));
}

//USERS REGISTRATION

module.exports.userRegister = async (req, res) => {
    const { phone, address, dob, name, email, password, barCouncilNo, specialization, lawyer } = req.body;
    const token = tokenHandler.verifyToken(req.token);
    res.json(token);
    console.log(token.id);
    console.log(req.body);
    const user = await User.create({
        name: name,
        phone: phone,
        address: address,
        dob: dob,
        email: email,
        password: password,
        barCouncilNo: barCouncilNo,
        specialization: specialization,
        lawyer: lawyer,
        roleId: token.id
    })
    res.json(new ResponseModel(user));
}


//USERS LOGIN

module.exports.userlogin = async (req, res) => {
    const token = tokenHandler.verifyToken(req.token);
    const { email, password} = req.body;
    var accessuser = await User.findOne({
        where: {
            email: email,
            password: password,
            roleId:token.id
        }
    });

    if (!accessuser) {
        return res.json(new ResponseModel(null, null, ['No client found']));
    }

    // Create token.
    const tokensec = tokenHandler.createToken({
        id: accessuser.id,
    });

    console.log('111111111111111111')
    console.log(accessuser.id);

    res.json(new ResponseModel(tokensec,['successfully logged as',token.role]));
}


//CASE INSERTION

module.exports.caseDetails = async (req, res) => {
    const { caseno, casedesc, casetype, paymentstatus } = req.body;
    const tokensec = tokenHandler.verifyToken(req.token);
    res.json(tokensec);
    console.log(tokensec.id);

    const casedetails = await Case.create({
        caseno: caseno,
        casedesc: casedesc,
        casetype: casetype,
        paymentstatus: paymentstatus,
        customerId: tokensec.id
    })
    res.json(new ResponseModel(casedetails));
}




//LAWYER SEARCH BY CLIENTS

module.exports.lawyerSearch = async (req, res) => {
    const { specialization } = req.body;
    var lawyer = await User.findAll(
        {
            where:
            {
                specialization: specialization
            }
        });
    if (!lawyer) {
        return res.json(new ResponseModel(null, null, ['No Lawyer found']));
    }

    res.json(new ResponseModel(lawyer));
}

//UPDATE USER TABLE(PROFILE UPDATE)

module.exports.updateUser = async (req, res, next) => {
    const tokensec = tokenHandler.verifyToken(req.token);
    var user = await User.findByPk(tokensec.id);
    await user.update(
        {
            name: req.body.name,
            phone: req.body.phone,
            address: req.body.address,
            dob: req.body.dob,
            password: req.body.password,
            barCouncilNo: req.body.barCouncilNo,
            specialization: req.body.specialization,
            lawyer: req.body.lawyer,
        },
        {
            where: {id: tokensec.id}
        }
    )
    if (!user) {
        return res.json(new ResponseModel(null, null, ['Not Updated']));
    }

    res.json(new ResponseModel(user));
}

//DELETE USERS BY ADMIN

module.exports.deleteUser = async (req, res, next) => {
    const {email} = req.body;
    let user = await User.destroy({
        where: {
            email: email
        }
    });
    if (!user) {
        return res.json(new ResponseModel(null, null, ['Deletion Failed']));
    }

    res.json(new ResponseModel(null,['Successfully deleted']));
}
  