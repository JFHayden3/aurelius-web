import { selectArticleSettingByArticleKind, selectViceRestrictions } from "./settingsSlice"
import { selectAllVices } from "./viceSlice"
import { selectAllVirtues } from "./virtueSlice"

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
  let restrictionIdCounter = 0
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
          id: restrictionIdCounter++,
          restriction: spec.restriction,
          activities: relevantVices.map(vice => vice.refTag),
          optNote: spec.notes
        }
      })

  const allVirtues = selectAllVirtues(state)
  let taskIdCounter = 0

  //  const { activity = { kind, content }, optDuration, optTime, optNotes } = task
  // engagementSchedule: [
  //   { days: [1, 3], instances: [{ optTime: { hour: 17, minute: 30 }, optDuration: { hour: 0, minute: 25 } }] },
  //   { days: [6], instances: [{ optTime: null, optDuration: { hour: 0, minute: 25 } }] },
  // ],
  const tasks = [].concat.apply([],
    allVirtues.map(virtue => {
      const relevantAppointments = virtue.engagementSchedule.filter(appt => appt.days.includes(todayDoW)) // TODO, maybe filter appts with empty instances
      const relevantInstances = [].concat.apply([], relevantAppointments.map(appt => appt.instances))
      const activity = { kind: "VIRTUE", content: virtue.refTag }
      return relevantInstances.map(instance => {
        return {
          id: taskIdCounter++,
          activity,
          optDuration: instance.optDuration,
          optTime: instance.optTime,
          optNotes: instance.optNotes
        }
      })
    }
    ).filter(tasks => tasks.length > 0))
    .sort((a, b) => {
      if (a.optTime && b.optTime) {
        const hourComp = a.optTime.hour - b.optTime.hour
        return hourComp !== 0 ? hourComp : a.optTime.minute - b.optTime.minute
      } else {
        return ((!b.optTime) - (!a.optTime))
      }
    })
  //filter to tuple of virtue + relevant instance pairs 

  return { restrictions, tasks }
}