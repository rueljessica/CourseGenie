/* eslint-disable prettier/prettier */
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import path from 'path'
import fs from 'fs'
import Application from '@ioc:Adonis/Core/Application'

export default class FilesController {
  public async show({ response, params }: HttpContextContract) {
    const fileName = params.id;
    return response.stream(fs.createReadStream(path.join(Application.publicPath('imgs'), fileName)))
  }
}