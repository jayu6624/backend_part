import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = mongoose.Schema({
    videoFile:{
        type:String,
        require:true,
    },
    thumbnail:{
        type:String,
        require:true,
    },
    title:{
        type:String,
        require:true,
    },
    description:{
        type:String,
        require:true,
    },
    duration:
    {
        type:Number,
        require:true,
    },view:{
        type:Number,
        default:0,
    },
    isPublished:{
        type:Boolean,
        default:true,
    },owner:{
       type:mongoose.Schema.Types.ObjectId,
       ref:"user" 
    }

})

videoSchema.plugin(mongooseAggregatePaginate)

export const videomodel = mongoose.model("videomodel",videoSchema)