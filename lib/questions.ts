// lib/questions.ts
export type Difficulty = 'easy' | 'medium' | 'hard' | 'beginner' | 'intermediate' | 'advanced'
export type VisualDiagramMode = 'flowchart' | 'mind_map' | 'table'

export interface VisualDiagramNode {
	id: string
	label: string
	x: number
	y: number
	kind?: string
}

export interface VisualDiagramEdge {
	id: string
	from: string
	to: string
	kind?: string
}

export interface VisualDiagramData {
	mode: VisualDiagramMode
	nodes: VisualDiagramNode[]
	edges: VisualDiagramEdge[]
	tableData?: string[][]
	rows?: number
	columns?: number
	tldrawSnapshot?: any
	persistenceKey?: string
}

export interface VideoQuestionData {
	videoUrl?: string
	videoName?: string
	coverUrl?: string
	coverName?: string
	title?: string
	instructions?: string
}

export type QuestionType = 
	| 'multiple_choice'
	| 'true_false'
	| 'code_snippet'
	| 'open_ended'
	| 'listening'
	| 'fill_in_blank'
	| 'match_pairs'
	| 'ordering'
	| 'math_equation'
	| 'graph_chart'
	| 'diagram_label'
	| 'image_mcq'
	| 'drawio_studio'
	| 'video'

export interface MatchPair {
	id: string
	left: string
	right: string
}

export interface OrderingStep {
	id: string
	content: string
}

export interface Label {
	id: string
	text: string
	x: number
	y: number
}

export type Question = {
	_id?: string
	question: string
	type: QuestionType
	options?: string[]
	answer?: string
	code?: string
	category: string
	subcategory?: string
	reason?: string
	difficulty?: Difficulty
	heading?: string
	description?: string
	media?: Array<{
		url: string
		type: 'image' | 'gif' | 'audio'
		position: number
		caption?: string
	}>
	// Type-specific fields
	audioUrl?: string
	listeningAnswerFormat?: 'mcq' | 'open'
	blankTemplate?: string
	blankAnswers?: string[]
	matchPairs?: Array<{ left: string; right: string }>
	orderItems?: string[]
	latex?: string
	diagramLabels?: Array<{ x: number; y: number; label: string }>
	drawioStudioData?: VisualDiagramData
	videoQuestionData?: VideoQuestionData
	requiresTranslation?: boolean
	starterCode?: string
	expectedOutput?: string
}

// Simple in-memory store fallback used on the client when server APIs are not available.
const clientStore: Question[] = []

export function addQuestion(q: Question) {
	try {
		// try to call server API (best-effort); if fetch fails, fallback to client store
		if (typeof window !== 'undefined') {
			fetch('/api/questions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(q),
			}).catch(() => {
				clientStore.push({ ...q, _id: String(Date.now()) })
			})
		} else {
			// server-side: push to in-memory store
			clientStore.push({ ...q, _id: String(Date.now()) })
		}
	} catch (e) {
		clientStore.push({ ...q, _id: String(Date.now()) })
	}
}

export function getAllQuestions(): Question[] {
	// try to access server API synchronously is not possible; return clientStore snapshot
	return [...clientStore]
}

export default {
	addQuestion,
	getAllQuestions,
}
