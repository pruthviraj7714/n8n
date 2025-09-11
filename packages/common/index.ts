import z from 'zod'


export const CredentialsSchema = z.object({
    data: z.record(z.any(),z.any()),
    title : z.string(),
    platform : z.enum(["TELEGRAM", "RESEND"], {error : "invalid platform"})
})