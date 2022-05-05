# Practical Email Management

{ toc }

## Context

Email users suffer from email overload.  This can lead to stress, decreased satisfaction and reduced productivity.  Unsolicited email can also include malware and security attacks like email spoofing and phishing.

**Issue:** https://github.com/robaone/source-pub/issues/4

## Decision

{ the change that we're proposing and/or doing and it can be copied from the issue document, required }
{ Audience: Everyone }

## Glossary

You can find the glossary [here](https://github.com/robaone/source/blob/main/glossary.md) in case a term in this technical plan is unfamiliar

- {term}: {definition, optional}  
{ Audience: Everyone   
  Reasoning: To ensure that anyone reading this documents understand any terminology used.    
  Please open a PR with your term(s) in the glossary if they are not already defined }

## Technical Risks / Assumptions { suggested, optional }

### ${The identified risk or assumption}

{ an explanation of the identified risk or assumption, optional}
{ Audience: Everyone
  Reasoning: In order to understand what it will take to derail this project, readers need to understand what is being assumed or what can risk the quality or completion of this project.  Try to speak clearly and in normal language here. }

#### Technical Risk Mitigation Strategies { optional }

1. ${ a desired state that will mitigate the aforementioned risk, required if a risk is identified }
1. ${ another desired state that will mitigate the aforementioned risk, optional }

{ Reasoning: By declaring the desired state that will mitigate the risk, readers can determine the scope of this project.  The identified risk and milestones go together.  This means that if you have a second identified risk, these sections must be repeated. }

## Prerequisites { optional }

- { tasks that need to be done in order to support the features, optional }
{ Audience: Everyone 
  Reasoning: This is where you will list chores that need to be done in order to support the features, optional }

### Diagrams

{ any diagrams that support the features. It can be hand drawn. highly preferred, optional }

## Feature: { name of feature, required }

{ user story in "in order / as a / i want " syntax, required }

### Scenario: { name of the scenario, required }

```gherkin
{ gherkin language for the scenario.  Use a markdown block. , required }
```

#### Notes

{ supporting notes, optional }

#### Code Sample

{ code samples, preferred no, optional }

#### Designs

- { design references, required when applicable }

#### UAT Steps

1. { uat steps to be performed }
{ Audience: The target user 
  Reasoning: In order to test the feature functionality, the target user needs to know how these features will be tested }

## Project Checklists

### Data model update
{ required }
{ Audience: developers }
1.Does this technical plan involve updating any existing data models? { yes or no }
   - { if yes, please describe your backwards-compatibility strategy -- how to handle out-of-date data }
1. Does this plan involve changes to client-exposed or expected data? { yes or no }
   - { if yes, please provide here the new agreed-upon data model }

### Potential for learning / expense
{ required }
{ Audience: developers and benefactors  }
1. Are you using a service or technology that's new?
   1. { yes or no }
2. Are you replacing a service or technology?
   1. { yes or no }

### Technical Debt
{ optional }
1. Have you considered addressing any technical debt in this plan?
    1. { link(s) to technical debt document(s) }
