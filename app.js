// Task1: initiate app and run server at 3000
const express = require('express');
const app = new express();
const cors = require('cors');
const logger = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
const { employeeModel } = require('./model/employeeList');

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'dist', 'Frontend')));
app.use(express.static(path.join(__dirname + '/dist/FrontEnd')));

// Task2: create mongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@cluster0.mongodb.net/EmployeeDB?retryWrites=true&w=majority';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Database Connected successfully to MongoDB Atlas!');
  })
  .catch((err) => {
    console.log('Error connecting to MongoDB Atlas:', err.message);
  });

//Task 2 : write api with error handling and appropriate api mentioned in the TODO below

//TODO: get data from db  using api '/api/employeelist'
app.get('/api/employeelist', async (req, res) => {
  try {
    const data = await employeeModel.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve employee information', message: error.message });
  }
});

//TODO: get single data from db  using api '/api/employeelist/:id'
app.get('/api/employeelist/:id', async (req, res) => {
  try {
    const data = await employeeModel.findById(req.params.id);
    if (!data) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve single employee information', message: error.message });
  }
});

//TODO: send data from db using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}
app.post('/api/employeelist', async (req, res) => {
  try {
    const { name, location, position, salary } = req.body;
    if (!name || !location || !position || salary === undefined || salary === null) {
      return res.status(400).json({ error: 'All fields (name, location, position, salary) are required' });
    }
    const newEmployee = new employeeModel({
      name,
      location,
      position,
      salary: Number(salary)
    });
    const savedDoc = await newEmployee.save();
    res.status(200).json(savedDoc);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add new employee to database', message: error.message });
  }
});

//TODO: delete a employee data from db by using api '/api/employeelist/:id'
app.delete('/api/employeelist/:id', async (req, res) => {
  try {
    const deletedDoc = await employeeModel.findByIdAndDelete(req.params.id);
    if (!deletedDoc) {
      return res.status(404).json({ error: 'Employee not found to delete' });
    }
    res.status(200).json({ message: 'Employee deleted successfully', result: deletedDoc });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete single employee from database', message: error.message });
  }
});

// Reusable update logic supporting both PUT /api/employeelist and PUT /api/employeelist/:id
const updateEmployee = async (id, data, res) => {
  try {
    if (!id) {
      return res.status(400).json({ error: 'Employee ID (_id or id) is required for update' });
    }
    const updateFields = {};
    if (data.name !== undefined) updateFields.name = data.name;
    if (data.location !== undefined) updateFields.location = data.location;
    if (data.position !== undefined) updateFields.position = data.position;
    if (data.salary !== undefined) updateFields.salary = Number(data.salary);

    const updatedDoc = await employeeModel.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ error: 'Employee not found to update' });
    }

    res.status(200).json(updatedDoc);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update employee information', message: error.message });
  }
};

//TODO: Update  a employee data from db by using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}
app.put('/api/employeelist', async (req, res) => {
  const targetId = req.body._id || req.body.id || req.query.id;
  await updateEmployee(targetId, req.body, res);
});

app.put('/api/employeelist/:id', async (req, res) => {
  await updateEmployee(req.params.id, req.body, res);
});

//! dont delete this code. it connects the front end file.
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname + '/dist/Frontend/index.html'));
});

// Server listening on http://localhost:3000/
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;
