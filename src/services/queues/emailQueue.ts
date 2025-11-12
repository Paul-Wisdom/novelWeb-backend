import {Queue} from 'bullmq'
import { EmailQueueJobData } from '../../utils/types'
import redisConnection from './config'


const emailQueue = new Queue<EmailQueueJobData>('emailQueue', {connection: redisConnection})

export default emailQueue