import { selectArticleSettingByArticleKind, selectViceRestrictions } from "./settingsSlice"
import { selectAllVices } from "./viceSlice"

export function getStartingContent(articleKind, state) {
  const articleSettings = selectArticleSettingByArticleKind(state, articleKind)
  const hint = articleSettings.hintText
  let additionalContent = {}
  if (articleKind === 'AGENDA') {
    additionalContent = getStartingContentForAgenda(new Date(Date.now()), state)
  } else {
    additionalContent = { text: "" }
  }
  additionalContent.hint = hint
  return additionalContent
}

function getStartingContentForAgenda(today, state) {
  const viceRestrictions = Object.entries(selectViceRestrictions(state))
  const allVices = selectAllVices(state)

  // Find vice restriction types that apply to 'today'
  const todayDoW = today.getDay()
  let idCounter = 0
  const restrictions =
    [].concat.apply([],
      viceRestrictions.map(([id, vr]) => 
        vr.spec.map(s => { return { id, spec: s } })
      ))
      // Filter to only those restriction specs that apply today
      .filter(idAndSpec => idAndSpec.spec.appliesOn.includes(todayDoW))
      // Join in the vices referencing each restriction 
      .map(idAndSpec => {
        const { id, spec } = idAndSpec
        const relevantVices = allVices.filter(vice => vice.defaultEngagementRestriction.kind === id)
        return { spec, relevantVices }
      })
      // Filter restrictions with no relevant vices
      .filter(specAndRelevantVices => specAndRelevantVices.relevantVices.length > 0)
      // Finally, turn it into the restriction object used by the agenda article
      .map(specAndRelevantVices => {
        const { spec, relevantVices } = specAndRelevantVices
        return {
          id: idCounter++,
          restriction: spec.restriction,
          activities: relevantVices.map(vice => vice.refTag),
          optNote: spec.notes
        }
      })
  const tasks = []
  return { restrictions, tasks }



  // const newVice = {
  //   id,
  //   name,
  //   refTag: tag,
  //   description: "",
  //   defaultEngagementRestriction: {
  //     kind: 0, 
  //   },
  // }
  // spec: [
  //   {
  //     restriction: "Total abstinence",
  //     appliesOn: [0, 1, 2, 3, 4, 5, 6],
  //     notes: ""
  //   }
  // ]
  // const newRestriction = {
  //       id: newId,
  //       restriction: "",
  //       activities: [""],
  //       optNote: null
  //     }
}