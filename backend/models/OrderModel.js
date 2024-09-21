const mongoose = require('mongoose');
const {Schema,model} =mongoose

const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  services: [
    {
      service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
      items: [
        {
          item: { type: String, required: true },
          quantity: { type: Number, required: true },
        }
      ]
    }
  ],
  pickupDate: { type: Date, required: true },
  pickupTime: { type: String, required: true },
  formatted_address: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String ,
   enum: ['Pending','Ordered','Completed','canceled','Confirmed',  'Picked Up','In Service', 'Delivered'],
        default: 'Pending'
  },
  orderPersonName: { type: String, required: true }, // Required field
  phoneNumber: { type: String, required: true },
  expiresAt: {
    type: Date,
    expires: '1h', 
    default: () => Date.now() + 60 * 60 * 100 // 1 hour from creation
}
}, { timestamps: true });

orderSchema.pre('save', function (next) {
  if (this.status === 'Pending') {
    this.expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour from creation
  } else {
    this.expiresAt = undefined; // Remove expiresAt if status is not Pending
  }
  next();
});
 
const  Order =model('Order',orderSchema)
module.exports =Order
