const Service = require('../models/ServiceModel');
const { validationResult } = require('express-validator');

const serviceControl = {};

// Create new service
serviceControl.createService = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        let prices = req.body.prices;
        if (typeof prices === 'string') {
            prices = JSON.parse(prices); // Parse JSON string into array 
        }

        const service = new Service({
            name: req.body.name,
            description: req.body.description,
            prices: prices,
            image: req.file ? `/uploads/${req.file.filename}` : null 
        });

        await service.save();
        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all services
serviceControl.getAllServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single service by ID
serviceControl.getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ error: "Service not found" });
        }
        res.status(200).json(service);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a service by ID
serviceControl.updateService = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        let prices = req.body.prices;
        if (typeof prices === 'string') {
            prices = JSON.parse(prices); // Parse JSON string into array 
        }

        const serviceData = {
            name: req.body.name,
            description: req.body.description,
            prices: prices,
        };

        // If a new image is uploaded, update the image field
        if (req.file) {
            serviceData.image = `/uploads/${req.file.filename}`;
        }

        const service = await Service.findByIdAndUpdate(req.params.id, serviceData, { new: true, runValidators: true });
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.status(200).json(service);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a service by ID
serviceControl.deleteService = async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = serviceControl;
