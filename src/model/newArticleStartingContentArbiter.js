import { selectArticleSettingByArticleKind, selectViceRestrictions } from "./settingsSlice"
import { computeNextViceLogId, createNewViceLogEntry } from './viceLogSlice'
import { selectActiveChallengesForDate, selectAllVirtues, selectAllVices } from "./tagEntitySlice"
import { dateAsYyyyMmDd } from '../kitchenSink'

export function getStartingContent(articleKind, state, dispatch) {
  const articleSettings = selectArticleSettingByArticleKind(state, articleKind)
  const hint = articleSettings.hintText
  let additionalContent = {}
  if (articleKind === 'AGENDA') {
    additionalContent = getStartingContentForAgenda(new Date(Date.now()), state)
  } else if (articleKind === 'VICE_LOG') {
    const nextViceLogId = computeNextViceLogId(state)
    const payload = {
      id: nextViceLogId,
      vices: [],
      date: null
    }
    dispatch(createNewViceLogEntry(payload))
    additionalContent = { logId: payload.id }
  } else {
    additionalContent = { text: "" }
  }
  additionalContent.hint = hint
  return additionalContent
}

function getStartingContentForAgenda(today, state) {
  const viceRestrictions = selectViceRestrictions(state)
  const allVices = selectAllVices(state)

  // Find vice restriction types that apply to 'today'
  const todayDoW = today.getDay()
  let restrictionIdCounter = 0
  let taskIdCounter = 0
  const getNextTaskId = () => taskIdCounter++

  // Gather up active challenges and translate sprints/fasts into tasks/restrictions for the day
  const activeChallenges = selectActiveChallengesForDate(state, dateAsYyyyMmDd(today))
  const challengeEffects = activeChallenges.map(challenge => {
    const sprints = challenge.effects.filter(effect => effect.kind === 'SPRINT')
    const fasts = challenge.effects.filter(effect => effect.kind === 'FAST')
    // Turn fasts into restrictions
    const restrictions = fasts.map(fast => {
      const restriction = viceRestrictions[fast.restrictionId].restriction
      const activities = fast.viceRefTags
      const id = restrictionIdCounter++
      const optNote = "Restricted due to #" + challenge.refTag
      return { id, restriction, activities, optNote }
    })
    const tasks = [].concat.apply([], sprints.map(sprint =>
      engagementScheduleToTasks(sprint.virtueRefTag, sprint.engagementSchedule, todayDoW, getNextTaskId)
    ).filter(tasks => tasks.length > 0))
    tasks.forEach(task => task.optNotes = "Scheduled as part of #" + challenge.refTag)
    return { restrictions, tasks }
  }).reduce((cume, curr) => {
    return {
      restrictions: cume.restrictions.concat(curr.restrictions),
      tasks: cume.tasks.concat(curr.tasks)
    }
  }, { restrictions: [], tasks: [] })

  // TODO: possibly filter or conditionally filter (based on user setting) the vices/virtues that
  // are already coming in as part of a challenge

  // Now get those restrictions/tasks that are just directly associated with vices/virtues 
  // (as opposed to being part of a particular challenge)
  const restrictions =
    [].concat.apply([],
      Object.entries(viceRestrictions).map(([id, vr]) =>
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

  //  const { activity = { kind, content }, optDuration, optTime, optNotes } = task
  // engagementSchedule: [
  //   { days: [1, 3], instances: [{ optTime: { hour: 17, minute: 30 }, optDuration: { hour: 0, minute: 25 } }] },
  //   { days: [6], instances: [{ optTime: null, optDuration: { hour: 0, minute: 25 } }] },
  // ],
  const tasks = [].concat.apply([],
    allVirtues.map(virtue =>
      engagementScheduleToTasks(virtue.refTag, virtue.engagementSchedule, todayDoW, getNextTaskId)
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
  return {
    restrictions: restrictions.concat(challengeEffects.restrictions),
    tasks: tasks.concat(challengeEffects.tasks)
  }
}

function engagementScheduleToTasks(refTag, engagementSchedule, todayDoW, getNextId) {
  const relevantAppointments = engagementSchedule.filter(appt => appt.days.includes(todayDoW)) // TODO, maybe filter appts with empty instances
  const relevantInstances = [].concat.apply([], relevantAppointments.map(appt => appt.instances))
  const activity = { kind: "VIRTUE", content: refTag }
  return relevantInstances.map(instance => {
    return {
      id: getNextId(),
      activity,
      optDuration: instance.optDuration,
      optTime: instance.optTime,
      optNotes: instance.optNotes
    }
  })
}