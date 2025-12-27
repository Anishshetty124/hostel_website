const Laundry = require('../models/Laundry');

// @desc    Get status of all machines
// @route   GET /api/laundry
exports.getLaundryStatus = async (req, res) => {
    try {
        // Initialize 3 machines if they don't exist (One-time setup)
        const count = await Laundry.countDocuments();
        if (count === 0) {
            await Laundry.insertMany([
                { machineNumber: 1 }, { machineNumber: 2 }, { machineNumber: 3 }
            ]);
        }
        const machines = await Laundry.find().sort({ machineNumber: 1 });
        res.json(machines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Book a machine (Toggle logic for now)
// @route   POST /api/laundry/book
exports.bookMachine = async (req, res) => {
    const { machineId } = req.body;
    try {
        const machine = await Laundry.findById(machineId);
        
        if (machine.isBusy) {
            // Check if requester is the owner (to allow stopping)
            if (machine.bookedBy.toString() !== req.user._id.toString()) {
                return res.status(400).json({ message: 'Machine is already busy' });
            }
            // Stop Machine
            machine.isBusy = false;
            machine.bookedBy = null;
            machine.startTime = null;
        } else {
            // Start Machine
            machine.isBusy = true;
            machine.bookedBy = req.user._id;
            machine.startTime = new Date();
        }
        
        await machine.save();
        res.json(machine);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};