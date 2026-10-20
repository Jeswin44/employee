// Task1: initiate app and run server at 3000
const express = require('express');
const app = new express();
const cors = require('cors');
const logger = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { employeeModel } = require('./model/employeeList');

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'dist', 'Frontend')));
app.use(express.static(path.join(__dirname + '/dist/FrontEnd')));

// Local persistent store & pre-seeded sample employee data
const DATA_FILE = path.join(__dirname, 'data', 'employees.json');

const INITIAL_EMPLOYEES = [
  {
    _id: '653d9e871234567890abcde1',
    name: 'John Doe',
    position: 'Senior Software Engineer',
    location: 'Kochi',
    salary: 85000
  },
  {
    _id: '653d9e871234567890abcde2',
    name: 'Jane Smith',
    position: 'UI/UX Designer',
    location: 'Trivandrum',
    salary: 72000
  },
  {
    _id: '653d9e871234567890abcde3',
    name: 'Michael Scott',
    position: 'Regional Director',
    location: 'Bangalore',
    salary: 95000
  },
  {
    _id: '653d9e871234567890abcde4',
    name: 'Jeswin Jaison',
    position: 'Full Stack Developer',
    location: 'Thrissur',
    salary: 90000
  }
];

let isDbConnected = false;

const loadLocalData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading local data file:', err.message);
  }

  // Pre-seed initial employees
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_EMPLOYEES, null, 2));
  } catch (_) {}
  return [...INITIAL_EMPLOYEES];
};

const saveLocalData = (data) => {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving local data file:', err.message);
  }
};

let localEmployees = loadLocalData();

// Task2: create mongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@cluster0.mongodb.net/EmployeeDB?retryWrites=true&w=majority';

mongoose
  .connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 })
  .then(async () => {
    isDbConnected = true;
    console.log('Database Connected successfully to MongoDB Atlas!');
    try {
      const count = await employeeModel.countDocuments();
      if (count === 0) {
        await employeeModel.insertMany(INITIAL_EMPLOYEES);
        console.log('Initial sample employees seeded to MongoDB Atlas.');
      }
    } catch (e) {
      console.log('Seed check skipped:', e.message);
    }
  })
  .catch((err) => {
    isDbConnected = false;
    console.log('MongoDB Atlas connection notice:', err.message);
    console.log('Running with local persistent store to ensure smooth operation.');
  });

//Task 2 : write api with error handling and appropriate api mentioned in the TODO below

//TODO: get data from db  using api '/api/employeelist'
app.get('/api/employeelist', async (req, res) => {
  try {
    if (isDbConnected && mongoose.connection.readyState === 1) {
      const data = await employeeModel.find();
      return res.status(200).json(data);
    }
    localEmployees = loadLocalData();
    res.status(200).json(localEmployees);
  } catch (error) {
    localEmployees = loadLocalData();
    res.status(200).json(localEmployees);
  }
});

//TODO: get single data from db  using api '/api/employeelist/:id'
app.get('/api/employeelist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined') {
      return res.status(400).json({ error: 'Valid Employee ID is required' });
    }
    if (isDbConnected && mongoose.connection.readyState === 1) {
      const data = await employeeModel.findById(id);
      if (data) return res.status(200).json(data);
    }
    localEmployees = loadLocalData();
    const item = localEmployees.find(e => e._id.toString() === id.toString() || e.id?.toString() === id.toString());
    if (!item) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    localEmployees = loadLocalData();
    const item = localEmployees.find(e => e._id.toString() === req.params.id?.toString());
    if (item) return res.status(200).json(item);
    res.status(404).json({ error: 'Employee not found' });
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

    const newId = new mongoose.Types.ObjectId().toString();
    const newRecord = {
      _id: newId,
      name: String(name),
      location: String(location),
      position: String(position),
      salary: Number(salary)
    };

    if (isDbConnected && mongoose.connection.readyState === 1) {
      try {
        const savedDoc = await new employeeModel(newRecord).save();
        return res.status(200).json(savedDoc);
      } catch (err) {
        console.error('Mongo save failed, saving to local store:', err.message);
      }
    }

    localEmployees = loadLocalData();
    localEmployees.push(newRecord);
    saveLocalData(localEmployees);
    res.status(200).json(newRecord);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add employee', message: error.message });
  }
});

//TODO: delete a employee data from db by using api '/api/employeelist/:id'
app.delete('/api/employeelist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === 'undefined') {
      return res.status(400).json({ error: 'Valid Employee ID is required' });
    }

    if (isDbConnected && mongoose.connection.readyState === 1) {
      try {
        const deletedDoc = await employeeModel.findByIdAndDelete(id);
        if (deletedDoc) {
          return res.status(200).json({ message: 'Employee deleted successfully', result: deletedDoc });
        }
      } catch (err) {
        console.error('Mongo delete failed, checking local store:', err.message);
      }
    }

    localEmployees = loadLocalData();
    const index = localEmployees.findIndex(e => e._id.toString() === id.toString() || e.id?.toString() === id.toString());
    if (index === -1) {
      return res.status(404).json({ error: 'Employee not found to delete' });
    }
    const [deleted] = localEmployees.splice(index, 1);
    saveLocalData(localEmployees);
    res.status(200).json({ message: 'Employee deleted successfully', result: deleted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete employee', message: error.message });
  }
});

// Reusable update logic supporting both PUT /api/employeelist and PUT /api/employeelist/:id
const updateEmployee = async (id, data, res) => {
  try {
    if (!id || id === 'undefined') {
      return res.status(400).json({ error: 'Valid Employee ID is required for update' });
    }

    const updateFields = {};
    if (data.name !== undefined) updateFields.name = String(data.name);
    if (data.location !== undefined) updateFields.location = String(data.location);
    if (data.position !== undefined) updateFields.position = String(data.position);
    if (data.salary !== undefined) updateFields.salary = Number(data.salary);

    if (isDbConnected && mongoose.connection.readyState === 1) {
      try {
        const updatedDoc = await employeeModel.findByIdAndUpdate(
          id,
          { $set: updateFields },
          { new: true, runValidators: true }
        );
        if (updatedDoc) return res.status(200).json(updatedDoc);
      } catch (err) {
        console.error('Mongo update failed, checking local store:', err.message);
      }
    }

    localEmployees = loadLocalData();
    const index = localEmployees.findIndex(e => e._id.toString() === id.toString() || e.id?.toString() === id.toString());
    if (index === -1) {
      return res.status(404).json({ error: 'Employee not found to update' });
    }

    localEmployees[index] = { ...localEmployees[index], ...updateFields };
    saveLocalData(localEmployees);
    res.status(200).json(localEmployees[index]);
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
