import express from 'express';
import { SimulationController } from '../controllers/simulationController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.post('/hotspot', SimulationController.simulateHotspot);
router.post('/routes', SimulationController.getAlternativeRoutes);
router.post('/vip-route', SimulationController.getVipRoute);
router.post('/vip-route/clear', SimulationController.clearVipRoute);
router.get('/city-state', SimulationController.getCityState);
router.get('/incidents/history', SimulationController.getIncidentHistory);
router.post('/incident', SimulationController.reportIncident);
router.post('/incidents/import', requireRole('POLICE'), SimulationController.importIncidents);
router.patch('/signal', requireRole('POLICE'), SimulationController.updateSignal);
router.post('/apply-intervention', requireRole('POLICE'), SimulationController.applyIntervention);
router.post('/revert-intervention', requireRole('POLICE'), SimulationController.revertIntervention);

// Adaptive Traffic Signal AI Showcase Endpoints
router.get('/adaptive-signal-state', SimulationController.getAdaptiveSignalState);
router.post('/adaptive-signal-optimize', SimulationController.runAdaptiveOptimization);

// Incident -> Autonomous Response Endpoints
router.post('/incident/execute-response', requireRole('POLICE'), SimulationController.executeIncidentResponsePlan);
router.post('/incident/simulate-accident', requireRole('POLICE'), SimulationController.simulateAccidentIncident);

// Weather Intelligence Endpoints
router.get('/weather-intelligence', SimulationController.getWeatherIntelligence);
router.post('/weather-intelligence', SimulationController.setWeatherIntelligence);

// Explainable AI (XAI) Endpoint
router.get('/explain-signal/:signalId?', SimulationController.explainSignalDecision);

// City Simulation / Digital Twin Endpoint
router.post('/digital-twin/run', SimulationController.runDigitalTwinSimulation);

// Infrastructure Stress Endpoints (SIH Problem Statement Pillar 3)
router.get('/infrastructure-stress/:nodeId?', SimulationController.getInfrastructureStress);
router.post('/infrastructure-stress/relieve', requireRole('POLICE'), SimulationController.applyInfrastructureRelief);

// Public Transport Integration Endpoints (6 Multimodal Layers & Dynamic Fleet Augmentation)
router.get('/public-transport/:corridorId?', SimulationController.getPublicTransport);
router.post('/public-transport/augment', requireRole('POLICE'), SimulationController.applyTransitAugmentation);

// AI Incident Prediction & Preventive Safety Shield Endpoints
router.get('/incident-prediction/:corridorId?', SimulationController.getIncidentPrediction);
router.post('/incident-prediction/prevent', requireRole('POLICE'), SimulationController.applyPreventiveAction);

export default router;
