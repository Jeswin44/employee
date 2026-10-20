const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    salary: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const employeeModel = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);

module.exports = employeeModel;
module.exports.employeeModel = employeeModel;
module.exports.Employee = employeeModel;
