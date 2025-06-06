import Super from '../../model/UserModel/Super.js';

export const createSuper = async(req,res) =>{
    try {
        const { name, email,phone,address, password } = req.body;
        const superUser = new Super({ name, email,phone,address, password });
        await superUser.save();
        res.status(201).json({ message: 'SuperAdmin created successfully', superUser });
    } catch (error) {
        res.status(500).json({ message: 'Error creating superAdmin', error: error.message });
    }
}

export const fetchSuperById = async (req, res) => {
    const { id } = req.params;
    console.log(id)
    try {
        const supper = await Super.findById(id).select('-password');
        if (!supper) {
            return res.status(404).json({ message: 'supper not found' });
        }
        return res.status(200).json({ message: 'supper retrieved successfully', supper });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching supper', error: error.message });
    }
};
