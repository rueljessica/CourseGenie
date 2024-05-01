import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DisciplinasCursada from 'App/Models/DisciplinasCursada';
import Professor from 'App/Models/Professor'
const unorm = require('unorm');

export default class ProfessorsController {
    public async list({ response, view }: HttpContextContract) {
        try {
            const list = await Professor.query().orderBy('nome', 'asc');
            return view.render('professors/professors', { professores: list })
        } catch (error) {
            return response.badRequest('Error')
        }
    }
    public async get({ params, response, view }: HttpContextContract) {
        try {
            const id = params.id;
            const normalizeString = (str) => unorm.nfd(str).replace(/[\u0300-\u036f]/g, '');

            const professor = await Professor.query()
                .where('id', id)
                .first();

            const disciplinasCursadas = await DisciplinasCursada.query()
                .whereRaw("LOWER(UNACCENT(professor)) = ?",
                normalizeString(professor?.nome.toLowerCase()))
                .select('media', 'situacao')

            
            const totalApr = disciplinasCursadas.filter(disciplina => ['cumpriu', 'apr', 'aprn', 'incorp', 'cump'].includes(disciplina.situacao.toLowerCase())).length;
            const totalRep = disciplinasCursadas.filter(disciplina => ['rec', 'rep', 'repf', 'repn', 'repmf', 'repnf'].includes(disciplina.situacao.toLowerCase())).length;
            const indiceAprGlobal = (totalApr / (totalRep + totalApr)) * 100;
            const media = disciplinasCursadas.reduce((acc, cur) => acc + cur.media, 0) / (totalRep + totalApr);

            return view.render('professors/professor', { professor: professor, media: media.toFixed(1), indiceApr: parseFloat(indiceAprGlobal.toFixed(0))})
        } catch (error) {
            return response.badRequest('Error' + error)
        }
    }
}
