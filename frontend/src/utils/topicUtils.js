/**
 * Generate a short learning insight from topic description
 */
export const generateLearningInsight = (description, difficulty) => {
  if (!description || description.trim().length === 0) {
    return difficulty === 'beginner' 
      ? 'Start with the basics and build your foundation step by step.'
      : difficulty === 'intermediate'
      ? 'Focus on understanding patterns and optimization techniques.'
      : 'Master advanced concepts through consistent practice and problem-solving.';
  }

  // Extract first meaningful sentence
  const sentences = description.split(/[.!?]\s+/).filter(s => s.trim().length > 20);
  
  if (sentences.length === 0) {
    return 'Practice regularly to master this topic.';
  }

  // Take first sentence and make it concise
  let insight = sentences[0].trim();
  
  // If too long, truncate intelligently
  if (insight.length > 120) {
    insight = insight.substring(0, 117) + '...';
  }

  // Add difficulty-specific context
  if (difficulty === 'beginner') {
    return insight.length < 80 ? insight : insight.substring(0, 77) + '...';
  }
  
  return insight;
};

/**
 * Extract 3 micro-concepts from topic description
 */
export const extractMicroConcepts = (description) => {
  if (!description || description.trim().length === 0) {
    return [
      'Core concepts',
      'Practical applications',
      'Problem-solving techniques'
    ];
  }

  // Split into sentences
  const sentences = description
    .split(/[.!?]\s+/)
    .filter(s => s.trim().length > 15 && s.trim().length < 150)
    .map(s => s.trim());

  if (sentences.length === 0) {
    return ['Key concepts', 'Applications', 'Practice'];
  }

  // Take up to 3 sentences, ensuring they're concise
  const concepts = sentences.slice(0, 3).map(sentence => {
    // Remove common prefixes and make concise
    let concept = sentence
      .replace(/^(This|These|The|A|An)\s+/i, '')
      .replace(/^[A-Z]/, c => c.toLowerCase());
    
    // Truncate if too long
    if (concept.length > 80) {
      concept = concept.substring(0, 77) + '...';
    }
    
    return concept;
  });

  // Ensure we have exactly 3
  while (concepts.length < 3) {
    concepts.push('Important concept to master');
  }

  return concepts.slice(0, 3);
};

/**
 * Truncate description to summary
 */
export const truncateDescription = (description, maxLength = 150) => {
  if (!description) return '';
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength - 3) + '...';
};

