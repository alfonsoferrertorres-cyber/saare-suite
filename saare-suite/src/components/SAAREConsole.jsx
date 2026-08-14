import React, { useState } from 'react';
import { 
  ShieldCheck, Activity, Cpu, Database, Layers, GitMerge, 
  Server, Terminal, Sliders 
} from 'lucide-react';

// Importa los componentes y datos separados
import OverviewDashboard from './components/OverviewDashboard';
import PipelineBuilder from './components/PipelineBuilder';
import { MODULES_DATA, PRESETS_DATA } from './data/saareData';
